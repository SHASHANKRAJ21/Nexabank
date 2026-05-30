package com.banking.loan.dto;

import com.banking.loan.model.Loan;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanDTO {
    private Long id;
    private String loanNumber;
    private String customerName;
    private String accountNumber;
    private String email;
    private String phone;
    private Loan.LoanType loanType;
    private BigDecimal principalAmount;
    private BigDecimal outstandingAmount;
    private BigDecimal emiAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private Integer paidEmis;
    private Integer remainingEmis;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextEmiDate;
    private Loan.LoanStatus status;
    private String collateral;
    private String purpose;
    private LocalDateTime createdAt;
}
