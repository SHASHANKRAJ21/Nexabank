package com.banking.account.dto;

import com.banking.account.model.Account;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDTO {
    private Long id;
    private String accountNumber;
    private String customerName;
    private String email;
    private String phone;
    private Account.AccountType accountType;
    private BigDecimal balance;
    private Account.AccountStatus status;
    private String ifscCode;
    private String branchName;
    private String city;
    private String state;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
