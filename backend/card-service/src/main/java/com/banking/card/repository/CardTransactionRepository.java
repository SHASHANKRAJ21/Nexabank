package com.banking.card.repository;

import com.banking.card.model.CardTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardTransactionRepository extends JpaRepository<CardTransaction, Long> {
    Page<CardTransaction> findByCardNumberOrderByCreatedAtDesc(String cardNumber, Pageable pageable);
}
