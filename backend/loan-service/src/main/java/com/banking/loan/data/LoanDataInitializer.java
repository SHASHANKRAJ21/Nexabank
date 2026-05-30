package com.banking.loan.data;

import com.banking.loan.model.EmiPayment;
import com.banking.loan.model.Loan;
import com.banking.loan.repository.EmiPaymentRepository;
import com.banking.loan.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoanDataInitializer implements CommandLineRunner {

    private final LoanRepository loanRepository;
    private final EmiPaymentRepository emiRepo;

    private static final String[] NAMES = {
        "Aarav Agarwal","Aditya Bansal","Akash Sharma","Amit Gupta","Ananya Singh",
        "Ankit Verma","Ankita Mishra","Arjun Reddy","Aryan Patel","Ayesha Khan",
        "Bharat Mehta","Deepak Joshi","Deepika Nair","Divya Pillai","Gaurav Rao",
        "Ishaan Chauhan","Kajal Arora","Karan Kapoor","Kavita Bhat","Kunal Jain",
        "Lakshmi Iyer","Manish Das","Meera Roy","Mohit Tiwari","Nandini Saxena",
        "Neha Sinha","Nikhil Shukla","Nisha Malhotra","Pankaj Chandra","Pooja Dubey",
        "Priya Trivedi","Rahul Sharma","Rajesh Kumar","Ravi Varma","Rohit Singh",
        "Sachin Patil","Sanjay Desai","Sara Fernandez","Shweta Ahuja","Sneha Chopra",
        "Sonam Bhatia","Suresh Dey","Tanmay Ghosh","Tanya Goyal","Uday Kulkarni",
        "Varun Mathur","Vijay Rastogi","Vikram Sen","Virat Shah","Aisha Pandey",
        "Ajay Yadav","Alok Dutta","Amrita Chawla","Anand Mukherjee","Asha Choudhary",
        "Ashok Dave","Avni Modi","Bhavna Khatri","Chirag Bajaj","Dhruv Bhattacharya",
        "Ekta Chatterjee","Farhan Chakraborty","Geeta Nayak","Harsh Sahoo","Hemant Pande",
        "Isha Jha","Jagdish Kaur","Jyoti Garg","Kapil Srivastava","Kavya Mishra",
        "Khushi Pandey","Komal Sharma","Krishna Verma","Leela Gupta","Madhur Singh",
        "Mahi Agarwal","Mayank Patel","Mihir Mehta","Mira Joshi","Mohan Reddy",
        "Mukesh Arora","Nalini Kapoor","Namita Iyer","Naveen Das","Neeraj Roy",
        "Nilesh Tiwari","Nimesh Saxena","Nirmal Sinha","Nita Shukla","Om Malhotra",
        "Pallavi Chandra","Pawan Dubey","Pragya Trivedi","Pranav Kumar","Preet Varma",
        "Preeti Singh","Priyansh Patil","Purvi Desai","Raghu Ahuja","Rajiv Chopra"
    };

    private static final String[] PURPOSES = {
        "Purchase of residential property","Purchase of vehicle","Higher education abroad",
        "Business expansion","Home renovation","Wedding expenses","Medical emergency",
        "Debt consolidation","Purchase of commercial property","Working capital requirement",
        "Purchase of two-wheeler","Children's education","Family vacation","Equipment purchase",
        "Gold ornaments purchase"
    };

    private static final String[] COLLATERALS = {
        "Property documents","Vehicle RC","Fixed Deposit","Gold ornaments","Insurance policy",
        "Shares and securities","None"
    };

    private final Random random = new Random(123);

    @Override
    public void run(String... args) {
        if (loanRepository.count() > 0) return;
        log.info("Seeding 1000 loans...");

        Loan.LoanType[] types = Loan.LoanType.values();
        Loan.LoanStatus[] statuses = {
            Loan.LoanStatus.ACTIVE, Loan.LoanStatus.ACTIVE, Loan.LoanStatus.ACTIVE,
            Loan.LoanStatus.DISBURSED, Loan.LoanStatus.CLOSED, Loan.LoanStatus.NPA,
            Loan.LoanStatus.APPROVED
        };

        List<Loan> loans = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            String name = NAMES[random.nextInt(NAMES.length)];
            Loan.LoanType type = types[random.nextInt(types.length)];
            Loan.LoanStatus status = statuses[random.nextInt(statuses.length)];

            BigDecimal principal = getLoanAmount(type);
            BigDecimal rate = getLoanRate(type);
            int tenure = getLoanTenure(type);

            // EMI calculation: P * r * (1+r)^n / ((1+r)^n - 1)
            double r = rate.doubleValue() / 100.0 / 12.0;
            double emi = principal.doubleValue() * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1);
            BigDecimal emiAmount = BigDecimal.valueOf(emi).setScale(2, RoundingMode.HALF_UP);

            int paidEmis = status == Loan.LoanStatus.CLOSED ? tenure
                    : random.nextInt(tenure);
            int remaining = tenure - paidEmis;

            BigDecimal outstanding = emiAmount.multiply(BigDecimal.valueOf(remaining))
                    .setScale(2, RoundingMode.HALF_UP);

            LocalDate start = LocalDate.now().minusMonths(paidEmis + random.nextInt(6));
            LocalDate end = start.plusMonths(tenure);
            LocalDate nextEmi = start.plusMonths(paidEmis + 1);

            String loanNum = String.format("LN%010d", 1000000000L + i);
            String phone = "9" + String.format("%09d", random.nextInt(1000000000));
            String email = name.toLowerCase().replace(" ", ".") + (i + 1) + "@email.com";

            Loan loan = Loan.builder()
                    .loanNumber(loanNum)
                    .customerName(name)
                    .accountNumber(String.format("ACC%010d", 1000000000L + i))
                    .email(email)
                    .phone(phone)
                    .loanType(type)
                    .principalAmount(principal)
                    .outstandingAmount(outstanding)
                    .emiAmount(emiAmount)
                    .interestRate(rate)
                    .tenureMonths(tenure)
                    .paidEmis(paidEmis)
                    .remainingEmis(remaining)
                    .startDate(start)
                    .endDate(end)
                    .nextEmiDate(nextEmi)
                    .status(status)
                    .collateral(COLLATERALS[random.nextInt(COLLATERALS.length)])
                    .purpose(PURPOSES[random.nextInt(PURPOSES.length)])
                    .createdAt(start.atStartOfDay().minusDays(30))
                    .updatedAt(LocalDateTime.now())
                    .build();
            loans.add(loan);
        }

        loanRepository.saveAll(loans);
        log.info("Saved 1000 loans");

        List<EmiPayment> emiList = new ArrayList<>();
        for (Loan loan : loans) {
            BigDecimal balance = loan.getPrincipalAmount();
            double r = loan.getInterestRate().doubleValue() / 100.0 / 12.0;
            for (int e = 1; e <= Math.min(loan.getPaidEmis(), 12); e++) {
                BigDecimal interest = balance.multiply(BigDecimal.valueOf(r)).setScale(2, RoundingMode.HALF_UP);
                BigDecimal prinComp = loan.getEmiAmount().subtract(interest).setScale(2, RoundingMode.HALF_UP);
                balance = balance.subtract(prinComp).max(BigDecimal.ZERO);
                LocalDate due = loan.getStartDate().plusMonths(e);
                EmiPayment emi = EmiPayment.builder()
                        .loanNumber(loan.getLoanNumber())
                        .emiNumber(e)
                        .amount(loan.getEmiAmount())
                        .principalComponent(prinComp)
                        .interestComponent(interest)
                        .balanceAfter(balance)
                        .dueDate(due)
                        .paidDate(due.plusDays(random.nextInt(5)))
                        .status(EmiPayment.PaymentStatus.PAID)
                        .createdAt(due.atStartOfDay())
                        .build();
                emiList.add(emi);
            }
        }
        emiRepo.saveAll(emiList);
        log.info("Saved {} EMI payments", emiList.size());
    }

    private BigDecimal getLoanAmount(Loan.LoanType type) {
        return switch (type) {
            case HOME_LOAN -> BigDecimal.valueOf(2000000 + random.nextInt(28000000)).setScale(2, RoundingMode.HALF_UP);
            case PERSONAL_LOAN -> BigDecimal.valueOf(50000 + random.nextInt(950000)).setScale(2, RoundingMode.HALF_UP);
            case CAR_LOAN -> BigDecimal.valueOf(300000 + random.nextInt(1700000)).setScale(2, RoundingMode.HALF_UP);
            case EDUCATION_LOAN -> BigDecimal.valueOf(200000 + random.nextInt(1800000)).setScale(2, RoundingMode.HALF_UP);
            case BUSINESS_LOAN -> BigDecimal.valueOf(500000 + random.nextInt(9500000)).setScale(2, RoundingMode.HALF_UP);
            case GOLD_LOAN -> BigDecimal.valueOf(50000 + random.nextInt(450000)).setScale(2, RoundingMode.HALF_UP);
        };
    }

    private BigDecimal getLoanRate(Loan.LoanType type) {
        return switch (type) {
            case HOME_LOAN -> BigDecimal.valueOf(6.5 + random.nextDouble() * 3).setScale(2, RoundingMode.HALF_UP);
            case PERSONAL_LOAN -> BigDecimal.valueOf(10.5 + random.nextDouble() * 8).setScale(2, RoundingMode.HALF_UP);
            case CAR_LOAN -> BigDecimal.valueOf(7.5 + random.nextDouble() * 4).setScale(2, RoundingMode.HALF_UP);
            case EDUCATION_LOAN -> BigDecimal.valueOf(8.0 + random.nextDouble() * 4).setScale(2, RoundingMode.HALF_UP);
            case BUSINESS_LOAN -> BigDecimal.valueOf(9.0 + random.nextDouble() * 6).setScale(2, RoundingMode.HALF_UP);
            case GOLD_LOAN -> BigDecimal.valueOf(7.0 + random.nextDouble() * 3).setScale(2, RoundingMode.HALF_UP);
        };
    }

    private int getLoanTenure(Loan.LoanType type) {
        return switch (type) {
            case HOME_LOAN -> 120 + random.nextInt(181);
            case PERSONAL_LOAN -> 12 + random.nextInt(49);
            case CAR_LOAN -> 24 + random.nextInt(49);
            case EDUCATION_LOAN -> 60 + random.nextInt(61);
            case BUSINESS_LOAN -> 12 + random.nextInt(85);
            case GOLD_LOAN -> 6 + random.nextInt(19);
        };
    }
}
