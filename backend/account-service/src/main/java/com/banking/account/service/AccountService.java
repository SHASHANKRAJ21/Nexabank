package com.banking.account.service;

import com.banking.account.dto.*;
import com.banking.account.model.Account;
import com.banking.account.model.Transaction;
import com.banking.account.repository.AccountRepository;
import com.banking.account.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public Page<AccountDTO> getAllAccounts(int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort).descending());
        return accountRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<AccountDTO> searchAccounts(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return accountRepository.searchAccounts(search, pageable).map(this::toDTO);
    }

    public AccountDTO getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
        return toDTO(account);
    }

    public AccountDTO getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found: " + id));
        return toDTO(account);
    }

    @Transactional
    public AccountDTO createAccount(CreateAccountRequest req) {
        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .customerName(req.getCustomerName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .accountType(req.getAccountType())
                .balance(req.getInitialDeposit())
                .status(Account.AccountStatus.ACTIVE)
                .ifscCode(generateIFSC(req.getBranchName()))
                .branchName(req.getBranchName())
                .city(req.getCity())
                .state(req.getState())
                .build();

        Account saved = accountRepository.save(account);

        // Record initial deposit transaction
        Transaction tx = Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .accountNumber(saved.getAccountNumber())
                .type(Transaction.TransactionType.CREDIT)
                .amount(req.getInitialDeposit())
                .balanceAfter(req.getInitialDeposit())
                .description("Account opening deposit")
                .status(Transaction.TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(tx);

        return toDTO(saved);
    }

    @Transactional
    public AccountDTO deposit(String accountNumber, BigDecimal amount, String description) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (account.getStatus() != Account.AccountStatus.ACTIVE)
            throw new RuntimeException("Account is not active");

        account.setBalance(account.getBalance().add(amount));
        Account saved = accountRepository.save(account);

        Transaction tx = Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .accountNumber(accountNumber)
                .type(Transaction.TransactionType.CREDIT)
                .amount(amount)
                .balanceAfter(saved.getBalance())
                .description(description != null ? description : "Deposit")
                .status(Transaction.TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(tx);

        return toDTO(saved);
    }

    @Transactional
    public AccountDTO withdraw(String accountNumber, BigDecimal amount, String description) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (account.getStatus() != Account.AccountStatus.ACTIVE)
            throw new RuntimeException("Account is not active");
        if (account.getBalance().compareTo(amount) < 0)
            throw new RuntimeException("Insufficient balance");

        account.setBalance(account.getBalance().subtract(amount));
        Account saved = accountRepository.save(account);

        Transaction tx = Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .accountNumber(accountNumber)
                .type(Transaction.TransactionType.DEBIT)
                .amount(amount)
                .balanceAfter(saved.getBalance())
                .description(description != null ? description : "Withdrawal")
                .status(Transaction.TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(tx);

        return toDTO(saved);
    }

    @Transactional
    public void updateStatus(Long id, Account.AccountStatus status) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setStatus(status);
        accountRepository.save(account);
    }

    public Page<Transaction> getTransactions(String accountNumber, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return transactionRepository.findByAccountNumberOrderByCreatedAtDesc(accountNumber, pageable);
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAccounts", accountRepository.count());
        stats.put("activeAccounts", accountRepository.countActiveAccounts());
        stats.put("totalDeposits", accountRepository.totalDeposits());
        return stats;
    }

    private AccountDTO toDTO(Account a) {
        return AccountDTO.builder()
                .id(a.getId())
                .accountNumber(a.getAccountNumber())
                .customerName(a.getCustomerName())
                .email(a.getEmail())
                .phone(a.getPhone())
                .accountType(a.getAccountType())
                .balance(a.getBalance())
                .status(a.getStatus())
                .ifscCode(a.getIfscCode())
                .branchName(a.getBranchName())
                .city(a.getCity())
                .state(a.getState())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

    private String generateAccountNumber() {
        return "ACC" + System.currentTimeMillis() % 1000000000L + (int)(Math.random() * 1000);
    }

    private String generateIFSC(String branch) {
        return "BANK0" + branch.substring(0, Math.min(3, branch.length())).toUpperCase()
                + String.format("%04d", (int)(Math.random() * 10000));
    }
}
