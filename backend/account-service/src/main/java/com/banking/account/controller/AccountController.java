package com.banking.account.controller;

import com.banking.account.dto.*;
import com.banking.account.model.Account;
import com.banking.account.model.Transaction;
import com.banking.account.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Accounts", description = "Account management APIs")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    @Operation(summary = "Get all accounts with pagination")
    public ResponseEntity<ApiResponse<Page<AccountDTO>>> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort) {
        Page<AccountDTO> accounts = accountService.getAllAccounts(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(accounts, "Accounts retrieved successfully"));
    }

    @GetMapping("/search")
    @Operation(summary = "Search accounts")
    public ResponseEntity<ApiResponse<Page<AccountDTO>>> searchAccounts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AccountDTO> accounts = accountService.searchAccounts(query, page, size);
        return ResponseEntity.ok(ApiResponse.success(accounts, "Search results"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<ApiResponse<AccountDTO>> getAccountById(@PathVariable Long id) {
        AccountDTO account = accountService.getAccountById(id);
        return ResponseEntity.ok(ApiResponse.success(account, "Account retrieved successfully"));
    }

    @GetMapping("/number/{accountNumber}")
    @Operation(summary = "Get account by account number")
    public ResponseEntity<ApiResponse<AccountDTO>> getAccountByNumber(@PathVariable String accountNumber) {
        AccountDTO account = accountService.getAccountByNumber(accountNumber);
        return ResponseEntity.ok(ApiResponse.success(account, "Account retrieved successfully"));
    }

    @PostMapping
    @Operation(summary = "Create new account")
    public ResponseEntity<ApiResponse<AccountDTO>> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        AccountDTO account = accountService.createAccount(request);
        return ResponseEntity.ok(ApiResponse.success(account, "Account created successfully"));
    }

    @PostMapping("/{accountNumber}/deposit")
    @Operation(summary = "Deposit to account")
    public ResponseEntity<ApiResponse<AccountDTO>> deposit(
            @PathVariable String accountNumber,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String description) {
        AccountDTO account = accountService.deposit(accountNumber, amount, description);
        return ResponseEntity.ok(ApiResponse.success(account, "Deposit successful"));
    }

    @PostMapping("/{accountNumber}/withdraw")
    @Operation(summary = "Withdraw from account")
    public ResponseEntity<ApiResponse<AccountDTO>> withdraw(
            @PathVariable String accountNumber,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String description) {
        AccountDTO account = accountService.withdraw(accountNumber, amount, description);
        return ResponseEntity.ok(ApiResponse.success(account, "Withdrawal successful"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update account status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestParam Account.AccountStatus status) {
        accountService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(null, "Status updated successfully"));
    }

    @GetMapping("/{accountNumber}/transactions")
    @Operation(summary = "Get account transactions")
    public ResponseEntity<ApiResponse<Page<Transaction>>> getTransactions(
            @PathVariable String accountNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Transaction> transactions = accountService.getTransactions(accountNumber, page, size);
        return ResponseEntity.ok(ApiResponse.success(transactions, "Transactions retrieved"));
    }

    @GetMapping("/stats/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = accountService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Stats retrieved"));
    }
}
