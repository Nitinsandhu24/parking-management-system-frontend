package com.parking.booking;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.parking.auth.UserRepository;

import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<BookingDTOs.BookingResponse>> getAll(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantId) {
        return ResponseEntity.ok(
                bookingService.findAll(pageable).map(BookingDTOs.BookingResponse::from)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTOs.BookingResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(BookingDTOs.BookingResponse.from(bookingService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<BookingDTOs.BookingResponse> create(
            @Valid @RequestBody BookingDTOs.CreateBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Booking booking = bookingService.createBooking(request, user.getId());
        return ResponseEntity.status(201).body(BookingDTOs.BookingResponse.from(booking));
    }

    @PatchMapping("/{id}/checkin")
    public ResponseEntity<BookingDTOs.BookingResponse> checkIn(@PathVariable UUID id) {
        return ResponseEntity.ok(BookingDTOs.BookingResponse.from(bookingService.checkIn(id)));
    }

    @PatchMapping("/{id}/checkout")
    public ResponseEntity<BookingDTOs.BookingResponse> checkOut(@PathVariable UUID id) {
        return ResponseEntity.ok(BookingDTOs.BookingResponse.from(bookingService.checkOut(id)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDTOs.BookingResponse> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(BookingDTOs.BookingResponse.from(bookingService.cancel(id)));
    }
}
