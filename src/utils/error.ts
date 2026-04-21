/**
 * Axios 에러 또는 일반 에러 객체로부터 사용자에게 보여줄 메시지를 추출합니다.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response: { data: { message?: string | string[] } } };
    if (axiosError.response?.data?.message) {
      const message = axiosError.response.data.message;
      return Array.isArray(message) ? message[0] : message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return "알 수 없는 오류가 발생했습니다.";
};
