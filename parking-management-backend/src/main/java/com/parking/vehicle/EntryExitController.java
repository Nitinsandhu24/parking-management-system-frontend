package com.parking.vehicle;

import com.parking.auth.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EntryExitController {

    private final EntryExitService entryExitService;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleLogRepository vehicleLogRepository;


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
            @PageableDefault(size = 20, sort = "eventTime", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String logType
    ) {

        Page<VehicleLog> logs;

        if (logType != null && !logType.isBlank()) {
            logs = vehicleLogRepository.findByLogType(
                    LogType.valueOf(logType.toUpperCase()),
                    pageable
            );
        } else {
            logs = vehicleLogRepository.findAll(pageable);
        }

        return ResponseEntity.ok(logs.map(VehicleDTOs.VehicleLogResponse::from));
    }


    @GetMapping("/vehicles/my")
    public ResponseEntity<List<VehicleDTOs.VehicleResponse>> getMyVehicles(
            @AuthenticationPrincipal UserDetails userDetails) {

        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                vehicleRepository.findByUserId(user.getId())
                        .stream()
                        .map(VehicleDTOs.VehicleResponse::from)
                        .toList()
        );
    }


    @GetMapping("/vehicles/logs/search")
    public ResponseEntity<List<VehicleDTOs.VehicleLogResponse>> searchByPlate(
            @RequestParam String plate) {
        return ResponseEntity.ok(entryExitService.findByPlate(plate).stream()
                .map(VehicleDTOs.VehicleLogResponse::from)
                .toList());
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


    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> removeVehicle(@PathVariable UUID id) {
        vehicleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}