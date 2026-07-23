using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace GroomingSalonApi.Utils;

public partial class PhoneNumberAttribute : ValidationAttribute
{
    public PhoneNumberAttribute()
        : base("Phone number must be 7-20 characters and contain only digits, spaces, and ()+- characters.")
    {
    }

    public override bool IsValid(object? value)
    {
        if (value is not string phone || string.IsNullOrWhiteSpace(phone))
        {
            return false;
        }

        return phone.Length is >= 7 and <= 20 && PhonePattern().IsMatch(phone);
    }

    [GeneratedRegex(@"^[\d\s()+\-]+$")]
    private static partial Regex PhonePattern();
}
