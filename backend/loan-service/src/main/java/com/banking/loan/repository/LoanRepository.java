package com.banking.loan.repository;

import com.banking.loan.model.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    Optional<Loan> findByLoanNumber(String loanNumber);
    List<Loan> findByAccountNumber(String accountNumber);
    Page<Loan> findByLoanType(Loan.LoanType type, Pageable pageable);
    Page<Loan> findByStatus(Loan.LoanStatus status, Pageable pageable);

    @Query("SELECT l FROM Loan l WHERE " +
           "LOWER(l.customerName) LIKE LOWER(CONCAT('%', :s, '%')) OR " +
           "l.loanNumber LIKE CONCAT('%', :s, '%') OR " +
           "l.accountNumber LIKE CONCAT('%', :s, '%')")
    Page<Loan> searchLoans(@Param("s") String search, Pageable pageable);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'ACTIVE'")
    long countActiveLoans();

    @Query("SELECT SUM(l.outstandingAmount) FROM Loan l WHERE l.status = 'ACTIVE'")
    java.math.BigDecimal totalOutstanding();

    @Query("SELECT SUM(l.principalAmount) FROM Loan l WHERE l.status = 'DISBURSED' OR l.status = 'ACTIVE'")
    java.math.BigDecimal totalDisbursed();
}
