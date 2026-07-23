using GroomingSalonApi.DTOs;
using GroomingSalonApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace GroomingSalonApi.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AppointmentDto>>> GetAll()
    {
        return Ok(await _appointmentService.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentDto>> GetById(int id)
    {
        return Ok(await _appointmentService.GetByIdAsync(id));
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentDto>> Create(AppointmentUpsertDto dto)
    {
        var appointment = await _appointmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, appointment);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AppointmentDto>> Update(int id, AppointmentUpsertDto dto)
    {
        return Ok(await _appointmentService.UpdateAsync(id, dto));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _appointmentService.DeleteAsync(id);
        return NoContent();
    }
}
