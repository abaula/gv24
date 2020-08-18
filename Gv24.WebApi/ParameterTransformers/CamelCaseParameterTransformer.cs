using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Routing;

namespace Gv24.WebApi.ParameterTransformers
{
    public class CamelCaseParameterTransformer: IOutboundParameterTransformer
    {
        public string TransformOutbound(object value)
        {
            if (value == null) 
                return null;
     
            return PathToCamelCase(value.ToString());
        }

        private static string PathToCamelCase(string path)
        {
            var segments = path.Split('/')
                .Select(FirstCharacterToLower)
                .ToArray();

            return string.Join('/', segments);
        }

        private static string FirstCharacterToLower(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || char.IsLower(value, 0))
                return value;

            return char.ToLowerInvariant(value[0]) + value.Substring(1);
        }
    }
}