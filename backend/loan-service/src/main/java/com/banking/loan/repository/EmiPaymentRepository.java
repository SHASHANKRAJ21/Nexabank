package com.banking.loan.repository;

import com.banking.loan.model.EmiPayment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmiPaymentRepository extends JpaRepository<EmiPayment, Long> {
    Page<EmiPayment> findByLoanNumberOrderByEmiNumber(String loanNumber, Pageable pageable);
}
