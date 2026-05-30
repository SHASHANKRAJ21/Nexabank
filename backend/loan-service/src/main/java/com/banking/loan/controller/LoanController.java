package com.banking.loan.controller;

import com.banking.loan.dto.*;
import com.banking.loan.model.EmiPayment;
import com.banking.loan.model.Loan;
import com.banking.loan.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Loans", description = "Loan management APIs")
public class LoanController {

    private final LoanService loanService;

    @GetMapping
    @Operation(summary = "Get all loans")
    public ResponseEntity<ApiResponse<Page<LoanDTO>>> getAllLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getAllLoans(page, size), "Loans retrieved"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<LoanDTO>>> searchLoans(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(loanService.searchLoans(query, page, size), "Search results"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LoanDTO>> getLoanById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getLoanById(id), "Loan retrieved"));
    }

    @GetMapping("/number/{loanNumber}")
    public ResponseEntity<ApiResponse<LoanDTO>> getLoanByNumber(@PathVariable String loanNumber) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getLoanByNumber(loanNumber), "Loan retrieved"));
    }

    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<ApiResponse<List<LoanDTO>>> getLoansByAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getLoansByAccount(accountNumber), "Loans retrieved"));
    }

    @GetMapping("/type/{loanType}")
    public ResponseEntity<ApiResponse<Page<LoanDTO>>> getLoansByType(
            @PathVariable Loan.LoanType loanType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getLoansByType(loanType, page, size), "Loans retrieved"));
    }

    @GetMapping("/{loanNumber}/emi-schedule")
    public ResponseEntity<ApiResponse<Page<EmiPayment>>> getEmiSchedule(
            @PathVariable String loanNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getEmiSchedule(loanNumber, page, size), "EMI schedule retrieved"));
    }

    @GetMapping("/stats/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(loanService.getDashboardStats(), "Stats retrieved"));
    }
}
