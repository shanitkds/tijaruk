import api from "../api/axios";

export type RfqLookupOption = {
  id: number;
  name: string;
};

export async function loadRfqLookups(options?: { skipAuth?: boolean; skipAuthRedirect?: boolean }) {
  const requestConfig = options?.skipAuth || options?.skipAuthRedirect
    ? ({ skipAuth: options?.skipAuth, skipAuthRedirect: options?.skipAuthRedirect } as any)
    : undefined;
  const [{ data: units }, { data: countries }] = await Promise.all([
    api.get<RfqLookupOption[]>("/rfqs/units/", requestConfig),
    api.get<RfqLookupOption[]>("/rfqs/countries/", requestConfig),
  ]);

  return { units, countries };
}

export async function createRfq(payload: FormData, options?: { skipAuthRedirect?: boolean }) {
  const requestConfig = options?.skipAuthRedirect
    ? ({ skipAuthRedirect: true } as any)
    : undefined;

  return api.post("/rfqs/", payload, requestConfig);
}

export function getRfqErrorMessage(error: unknown) {
  const data = (
    error as {
      response?: { data?: Record<string, string | string[] | Record<string, string[]>> };
    }
  ).response?.data;

  if (!data) {
    return "Unable to submit the RFQ. Please try again.";
  }

  const firstValue = Object.values(data)[0];
  if (typeof firstValue === "string") {
    return firstValue;
  }
  if (Array.isArray(firstValue)) {
    return firstValue[0] || "Unable to submit the RFQ. Please try again.";
  }
  if (firstValue && typeof firstValue === "object") {
    const nestedValue = Object.values(firstValue)[0];
    return nestedValue?.[0] || "Unable to submit the RFQ. Please try again.";
  }

  return "Unable to submit the RFQ. Please try again.";
}
