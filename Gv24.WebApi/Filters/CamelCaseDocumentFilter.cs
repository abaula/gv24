using System.Collections.Generic;
using System.Linq;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Gv24.WebApi.Filters
{
    public class CamelCaseDocumentFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            var paths = new Dictionary<string, OpenApiPathItem>(swaggerDoc.Paths);

            foreach (var path in paths)
            {
                var oldKey = path.Key;
                var newKey = PathToCamelCase(oldKey);

                if (newKey != oldKey)
                {
                    swaggerDoc.Paths.Remove(oldKey);
                    swaggerDoc.Paths.Add(newKey, path.Value);
                }
            }
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