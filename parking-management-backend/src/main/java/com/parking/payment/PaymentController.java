package com.parking.payment;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<Page<PaymentDTOs.PaymentResponse>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(paymentService.findAll(pageable)
                .map(PaymentDTOs.PaymentResponse::from));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDTOs.PaymentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(PaymentDTOs.PaymentResponse.from(paymentService.findById(id)));
    }

    @PostMapping("/initiate")
    public ResponseEntity<PaymentDTOs.PaymentResponse> initiate(
            @Valid @RequestBody PaymentDTOs.InitiatePaymentRequest request) {
        return ResponseEntity.status(201)
                .body(PaymentDTOs.PaymentResponse.from(paymentService.initiatePayment(request)));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<PaymentDTOs.PaymentResponse> confirm(
            @PathVariable UUID id,
            @RequestParam(required = false) String transactionId) {
        return ResponseEntity.ok(PaymentDTOs.PaymentResponse.from(
                paymentService.confirmPayment(id, transactionId)));
    }

    @PatchMapping("/{id}/refund")
    public ResponseEntity<PaymentDTOs.PaymentResponse> refund(@PathVariable UUID id) {
        return ResponseEntity.ok(PaymentDTOs.PaymentResponse.from(paymentService.refund(id)));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<PaymentDTOs.InvoiceResponse> getInvoice(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.getInvoice(id));
    }
}
