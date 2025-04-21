export const sensitiveKeywords = [
  'sex', 'khiêu dâm', 'erotic', 'người lớn', '18+',
  'bạo lực', 'violence', 'blood', 'máu me',
  'cờ bạc', 'gambling', 'casino',
  'ma túy', 'drugs', 'cocaine',
  'tự tử', 'suicide', 'giết người',
  // Thêm các từ khóa khác
];

export const checkBlockedContent = (text) => {
  if (!text) return false;
  
  return sensitiveKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
};

export const filterSafeContent = (items) => {
  return items.filter(item => 
    !sensitiveKeywords.some(keyword =>
      item.toLowerCase().includes(keyword.toLowerCase())
    )
  );
};
