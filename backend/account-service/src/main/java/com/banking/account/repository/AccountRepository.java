package com.banking.account.repository;

import com.banking.account.model.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountNumber(String accountNumber);
    List<Account> findByEmail(String email);
    Page<Account> findAll(Pageable pageable);
    Page<Account> findByAccountType(Account.AccountType type, Pageable pageable);
    Page<Account> findByStatus(Account.AccountStatus status, Pageable pageable);

    @Query("SELECT a FROM Account a WHERE " +
           "LOWER(a.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "a.accountNumber LIKE CONCAT('%', :search, '%') OR " +
           "LOWER(a.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Account> searchAccounts(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Account a WHERE a.status = 'ACTIVE'")
    long countActiveAccounts();

    @Query("SELECT SUM(a.balance) FROM Account a WHERE a.status = 'ACTIVE'")
    java.math.BigDecimal totalDeposits();
}
