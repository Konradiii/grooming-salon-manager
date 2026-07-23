using GroomingSalonApi.DTOs;
using GroomingSalonApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace GroomingSalonApi.Controllers;

[ApiController]
[Route("api/owners")]
public class OwnersController : ControllerBase
{
    private readonly IOwnerService _ownerService;

    public OwnersController(IOwnerService ownerService)
    {
        _ownerService = ownerService;
    }

    [HttpGet]
    public async Task<ActionResult<List<OwnerDto>>> GetAll()
    {
        return Ok(await _ownerService.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OwnerDto>> GetById(int id)
    {
        return Ok(await _ownerService.GetByIdAsync(id));
    }

    [HttpPost]
    public async Task<ActionResult<OwnerDto>> Create(OwnerUpsertDto dto)
    {
        var owner = await _ownerService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = owner.Id }, owner);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<OwnerDto>> Update(int id, OwnerUpsertDto dto)
    {
        return Ok(await _ownerService.UpdateAsync(id, dto));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _ownerService.DeleteAsync(id);
        return NoContent();
    }
}
