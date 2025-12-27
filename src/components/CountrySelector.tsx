interface Country {
  code: string;
  name: string;
  flag: string;
  subdomain: string;
  dataFile: string;
}

const countries: Country[] = [
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', subdomain: 'nepal', dataFile: 'nepal-government' },
  { code: 'US', name: 'United States', flag: '🇺🇸', subdomain: 'usa', dataFile: 'usa-government' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', subdomain: 'uk', dataFile: 'uk-government' },
  { code: 'IN', name: 'India', flag: '🇮🇳', subdomain: 'india', dataFile: 'india-government' },
  { code: 'CN', name: 'China', flag: '🇨🇳', subdomain: 'china', dataFile: 'china-government' },
];

interface CountrySelectorProps {
  currentCountry: string;
}

function getSubdomainUrl(subdomain: string): string {
  const hostname = window.location.hostname;

  // Handle localhost development
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    // For local development, use query parameter instead
    return `${window.location.protocol}//${hostname}${window.location.port ? ':' + window.location.port : ''}?data=${subdomain}-government`;
  }

  // For production on Cloudflare Pages without custom domain
  // Use query parameters instead of subdomains since *.pages.dev doesn't support custom subdomains
  if (hostname.endsWith('.pages.dev')) {
    return `${window.location.protocol}//${hostname}${window.location.pathname}?data=${subdomain}-government`;
  }

  // For custom domains: Build subdomain URL
  // From 'yourdomain.com' → 'nepal.yourdomain.com'
  // From 'nepal.yourdomain.com' → 'usa.yourdomain.com'
  const parts = hostname.split('.');
  let baseDomain: string;

  if (parts.length >= 3) {
    // Already has a subdomain, replace it
    baseDomain = parts.slice(1).join('.');
  } else {
    // No subdomain, use as-is
    baseDomain = hostname;
  }

  return `${window.location.protocol}//${subdomain}.${baseDomain}${window.location.pathname}`;
}

export function CountrySelector({ currentCountry }: CountrySelectorProps) {
  const handleCountryChange = (subdomain: string) => {
    const url = getSubdomainUrl(subdomain);
    window.location.href = url;
  };

  return (
    <div className="absolute top-4 left-4 z-40 flex gap-1 bg-white rounded-md shadow-md px-1 py-1 border border-gray-200">
      {countries.map((country) => (
        <button
          key={country.code}
          onClick={() => handleCountryChange(country.subdomain)}
          className={`
            flex items-center justify-center
            w-10 h-10 rounded
            transition-all duration-200
            ${
              currentCountry === country.dataFile
                ? 'bg-gray-100 scale-110 shadow-sm ring-2 ring-blue-400'
                : 'bg-gray-50 hover:bg-gray-100 hover:scale-105'
            }
          `}
          title={country.name}
        >
          <span className="text-xl">{country.flag}</span>
        </button>
      ))}
    </div>
  );
}
