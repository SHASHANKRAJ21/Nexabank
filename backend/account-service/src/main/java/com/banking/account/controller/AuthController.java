package com.banking.account.controller;

import com.banking.account.dto.AuthRequest;
import com.banking.account.dto.AuthResponse;
import com.banking.account.dto.ChangePasswordRequest;
import com.banking.account.dto.RegisterRequest;
import com.banking.account.model.User;
import com.banking.account.repository.UserRepository;
import com.banking.account.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Value("${otp.expiry-ms:300000}") private long otpExpiryMs;

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private record OtpEntry(String otp, long expiresAt, int attempts) {}
    private record LockEntry(int fails, long lockedUntil) {}

    private static final Map<String, OtpEntry>  OTP_STORE  = new ConcurrentHashMap<>();
    private static final Map<String, LockEntry> LOGIN_LOCK = new ConcurrentHashMap<>();
    private static final Random RNG = new Random();

    private static final int  MAX_LOGIN_ATTEMPTS = 5;
    private static final int  MAX_OTP_ATTEMPTS   = 3;
    private static final long LOCK_DURATION_MS   = 15 * 60_000L;

    public AuthController(AuthenticationManager authManager, UserRepository userRepository,
                          PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.authManager = authManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ── Step 1: validate password ─────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        String username = request.getUsername();

        LockEntry lock = LOGIN_LOCK.get(username);
        if (lock != null && lock.fails() >= MAX_LOGIN_ATTEMPTS) {
            long remaining = (lock.lockedUntil() - System.currentTimeMillis()) / 1000;
            if (remaining > 0) {
                return ResponseEntity.status(429).body(Map.of(
                        "error", "Account locked. Try again in " + remaining + " seconds."));
            }
            LOGIN_LOCK.remove(username);
        }

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.getPassword()));
        } catch (BadCredentialsException e) {
            LockEntry prev = LOGIN_LOCK.getOrDefault(username, new LockEntry(0, 0));
            int newFails = prev.fails() + 1;
            long lockedUntil = newFails >= MAX_LOGIN_ATTEMPTS
                    ? System.currentTimeMillis() + LOCK_DURATION_MS : 0;
            LOGIN_LOCK.put(username, new LockEntry(newFails, lockedUntil));
            int left = MAX_LOGIN_ATTEMPTS - newFails;
            if (left <= 0) return ResponseEntity.status(429).body(Map.of(
                    "error", "Account locked for 15 minutes after too many failed attempts."));
            return ResponseEntity.status(401).body(Map.of(
                    "error", "Invalid username or password. " + left + " attempt(s) left."));
        }

        LOGIN_LOCK.remove(username);
        return ResponseEntity.ok(Map.of("status", "OTP_REQUIRED", "username", username));
    }

    // ── Step 2: generate OTP and return it (dev mode) ─────────────────────────
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String phone    = body.get("phone");

        if (username == null || username.isBlank() || phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and phone are required."));
        }
        if (!phone.matches("^[6-9][0-9]{9}$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Enter a valid 10-digit Indian mobile number."));
        }

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found."));
        }

        if (user.getPhone() == null || user.getPhone().isBlank()) {
            user.setPhone(phone);
            userRepository.save(user);
        } else if (!user.getPhone().equals(phone)) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Phone number does not match our records. Contact admin."));
        }

        String otp = String.format("%06d", RNG.nextInt(1_000_000));
        OTP_STORE.put(username, new OtpEntry(otp, System.currentTimeMillis() + otpExpiryMs, 0));
        log.info("OTP for {} ({}): {}", username, maskPhone(phone), otp);

        // Dev mode — OTP shown on screen (click the yellow banner to auto-fill)
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to " + maskPhone(phone),
                "devOtp",  otp,
                "devMode", true
        ));
    }

    // ── Step 3: verify OTP ────────────────────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String otp      = body.get("otp");

        if (username == null || otp == null || otp.length() != 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request."));
        }

        OtpEntry entry = OTP_STORE.get(username);
        if (entry == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "No OTP found. Please request a new one.", "code", "NO_OTP"));
        }
        if (System.currentTimeMillis() > entry.expiresAt()) {
            OTP_STORE.remove(username);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "OTP expired. Please request a new one.", "code", "OTP_EXPIRED"));
        }
        if (!entry.otp().equals(otp)) {
            int attempts = entry.attempts() + 1;
            if (attempts >= MAX_OTP_ATTEMPTS) {
                OTP_STORE.remove(username);
                return ResponseEntity.status(429).body(Map.of(
                        "error", "Too many wrong attempts. Please request a new OTP.", "code", "MAX_ATTEMPTS"));
            }
            OTP_STORE.put(username, new OtpEntry(entry.otp(), entry.expiresAt(), attempts));
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Incorrect OTP. " + (MAX_OTP_ATTEMPTS - attempts) + " attempt(s) remaining.",
                    "code", "WRONG_OTP"));
        }

        OTP_STORE.remove(username);
        User user = userRepository.findByUsername(username).orElseThrow();
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        log.info("User '{}' logged in successfully", username);
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
    }

    // ── Secured endpoints ─────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal String username) {
        if (username == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized."));
        User user = userRepository.findByUsername(username).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email",    user.getEmail(),
                "role",     user.getRole().name(),
                "phone",    user.getPhone() != null ? maskPhone(user.getPhone()) : ""
        ));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                             @AuthenticationPrincipal String username) {
        if (username == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized."));
        User user = userRepository.findByUsername(username).orElseThrow();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect."));
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be different from current."));
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user '{}'", username);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken."));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered."));
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@AuthenticationPrincipal String username) {
        if (username == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized."));
        User requester = userRepository.findByUsername(username).orElseThrow();
        if (requester.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required."));
        }
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id",       u.getId(),
                        "username", u.getUsername(),
                        "email",    u.getEmail(),
                        "role",     u.getRole().name(),
                        "phone",    u.getPhone() != null ? maskPhone(u.getPhone()) : "—"
                ))
                .toList();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id,
                                             @RequestBody Map<String, String> body,
                                             @AuthenticationPrincipal String username) {
        if (username == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized."));
        User requester = userRepository.findByUsername(username).orElseThrow();
        if (requester.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required."));
        }
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));
        String roleStr = body.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required."));
        }
        try {
            User.Role newRole = User.Role.valueOf(roleStr);
            User.Role oldRole = target.getRole();
            target.setRole(newRole);
            userRepository.save(target);
            log.info("Admin '{}' changed role of '{}': {} → {}", username, target.getUsername(), oldRole, newRole);
            return ResponseEntity.ok(Map.of("message", "Role updated."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + roleStr));
        }
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return "XXXXXX" + phone.substring(phone.length() - 4);
    }
}
