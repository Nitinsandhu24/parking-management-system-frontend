package com.parking.vehicle;

import com.parking.auth.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EntryExitController {

    private final EntryExitService entryExitService;
    private final UserRepository userRepository;

    @PostMapping("/vehicles/entry")
    public ResponseEntity<VehicleDTOs.VehicleLogResponse> logEntry(
            @Valid @RequestBody VehicleDTOs.EntryRequest request) {
        return ResponseEntity.status(201)
                .body(VehicleDTOs.VehicleLogResponse.from(entryExitService.logEntry(request)));
    }

    @PostMapping("/vehicles/exit")
    public ResponseEntity<VehicleDTOs.VehicleLogResponse> logExit(
            @Valid @RequestBody VehicleDTOs.ExitRequest request) {
        return ResponseEntity.status(201)
                .body(VehicleDTOs.VehicleLogResponse.from(entryExitService.logExit(request)));
    }

    @GetMapping("/vehicles/logs")
    public ResponseEntity<Page<VehicleDTOs.VehicleLogResponse>> getLogs(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(entryExitService.findAll(pageable)
                .map(VehicleDTOs.VehicleLogResponse::from));
    }

    @GetMapping("/vehicles/logs/search")
    public ResponseEntity<List<VehicleDTOs.VehicleLogResponse>> searchByPlate(
            @RequestParam String plate) {
        return ResponseEntity.ok(entryExitService.findByPlate(plate).stream()
                .map(VehicleDTOs.VehicleLogResponse::from).toList());
    }

    @PostMapping("/vehicles/register")
    public ResponseEntity<VehicleDTOs.VehicleResponse> registerVehicle(
            @Valid @RequestBody VehicleDTOs.RegisterVehicleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.status(201)
                .body(VehicleDTOs.VehicleResponse.from(
                        entryExitService.registerVehicle(request, user.getId())));
    }

    @GetMapping("/vehicles/my")
    public ResponseEntity<List<VehicleDTOs.VehicleResponse>> myVehicles(
            @AuthenticationPrincipal UserDetails userDetails) {
        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(entryExitService.findVehiclesByUser(user.getId()).stream()
                .map(VehicleDTOs.VehicleResponse::from).toList());
    }
}
