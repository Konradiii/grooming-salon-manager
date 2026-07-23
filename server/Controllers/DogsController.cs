using GroomingSalonApi.DTOs;
using GroomingSalonApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace GroomingSalonApi.Controllers;

[ApiController]
[Route("api/dogs")]
public class DogsController : ControllerBase
{
    private readonly IDogService _dogService;

    public DogsController(IDogService dogService)
    {
        _dogService = dogService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DogDto>>> GetAll()
    {
        return Ok(await _dogService.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DogDto>> GetById(int id)
    {
        return Ok(await _dogService.GetByIdAsync(id));
    }

    [HttpPost]
    public async Task<ActionResult<DogDto>> Create(DogUpsertDto dto)
    {
        var dog = await _dogService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = dog.Id }, dog);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<DogDto>> Update(int id, DogUpsertDto dto)
    {
        return Ok(await _dogService.UpdateAsync(id, dto));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _dogService.DeleteAsync(id);
        return NoContent();
    }
}
