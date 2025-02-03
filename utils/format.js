export const formatDateTime = (date) => {
  const dateObj = new Date(date); // 날짜 문자열을 Date 객체로 변환
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

export const formatNumber = (number) => {
  if (number >= 1000) return `${Math.floor(number / 1000)}k`;
  return number;
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const timeGap = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(timeGap / (1000 * 60));
  const hours = Math.floor(timeGap / (1000 * 60 * 60));
  const days = Math.floor(timeGap / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return formatDateTime(date);
};
