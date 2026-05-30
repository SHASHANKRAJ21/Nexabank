package com.banking.loan.service;

import com.banking.loan.dto.*;
import com.banking.loan.model.EmiPayment;
import com.banking.loan.model.Loan;
import com.banking.loan.repository.EmiPaymentRepository;
import com.banking.loan.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final EmiPaymentRepository emiRepo;

    public Page<LoanDTO> getAllLoans(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return loanRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<LoanDTO> searchLoans(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return loanRepository.searchLoans(search, pageable).map(this::toDTO);
    }

    public LoanDTO getLoanById(Long id) {
        return toDTO(loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found: " + id)));
    }

    public LoanDTO getLoanByNumber(String loanNumber) {
        return toDTO(loanRepository.findByLoanNumber(loanNumber)
                .orElseThrow(() -> new RuntimeException("Loan not found: " + loanNumber)));
    }

    public List<LoanDTO> getLoansByAccount(String accountNumber) {
        return loanRepository.findByAccountNumber(accountNumber).stream().map(this::toDTO).toList();
    }

    public Page<LoanDTO> getLoansByType(Loan.LoanType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return loanRepository.findByLoanType(type, pageable).map(this::toDTO);
    }

    public Page<EmiPayment> getEmiSchedule(String loanNumber, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("emiNumber").ascending());
        return emiRepo.findByLoanNumberOrderByEmiNumber(loanNumber, pageable);
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLoans", loanRepository.count());
        stats.put("activeLoans", loanRepository.countActiveLoans());
        stats.put("totalOutstanding", loanRepository.totalOutstanding());
        stats.put("totalDisbursed", loanRepository.totalDisbursed());
        return stats;
    }

    private LoanDTO toDTO(Loan l) {
        return LoanDTO.builder()
                .id(l.getId())
                .loanNumber(l.getLoanNumber())
                .customerName(l.getCustomerName())
                .accountNumber(l.getAccountNumber())
                .email(l.getEmail())
                .phone(l.getPhone())
                .loanType(l.getLoanType())
                .principalAmount(l.getPrincipalAmount())
                .outstandingAmount(l.getOutstandingAmount())
                .emiAmount(l.getEmiAmount())
                .interestRate(l.getInterestRate())
                .tenureMonths(l.getTenureMonths())
                .paidEmis(l.getPaidEmis())
                .remainingEmis(l.getRemainingEmis())
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .nextEmiDate(l.getNextEmiDate())
                .status(l.getStatus())
                .collateral(l.getCollateral())
                .purpose(l.getPurpose())
                .createdAt(l.getCreatedAt())
                .build();
    }
}
