import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";

export type ServerFunctionResponse<T> = {
    data: T | null;
    error: string | null;
};

export function handleServerFunctionResponse<T>(
    response: { data: any; error: any },
) {
    try {
        // First check for Supabase function invocation errors
        if (response.error) {
            let errorMessage = "";
            if (response.error instanceof FunctionsHttpError) {
                errorMessage = response.error.context.json();
            } else if (response.error instanceof FunctionsRelayError) {
                errorMessage = response.error.message;
            } else if (response.error instanceof FunctionsFetchError) {
                errorMessage = response.error.message;
            } else {
                errorMessage = response.error.message ||
                    "Unknown error occurred";
            }
            return { data: null, error: errorMessage };
        }

        // Then check for server function errors
        if (response.data?.error) {
            return { data: null, error: response.data.error };
        }

        // Success case
        return { data: response.data?.data || null, error: null };
    } catch (e) {
        console.error("Error handling server function response:", e);
        const error = e as Error;
        return { data: null, error: error.message || "Unknown error occurred" };
    }
}
