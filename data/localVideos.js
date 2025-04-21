export const popularVideos = [
  {
    id: 'video1',
    title: 'Bài tập thể dục buổi sáng cho người cao tuổi',
    description: 'Các bài tập đơn giản giúp tăng cường sức khỏe',
    thumbnail: 'https://i.ytimg.com/vi/dGRTMTzdQ5M/maxresdefault.jpg',
    url: 'https://youtu.be/dGRTMTzdQ5M',
    duration: '10:25',
    views: 15423,
    date: '2023-06-15'
  },
  {
    id: 'video2',
    title: 'Hướng dẫn tập yoga cơ bản tại nhà',
    description: 'Giãn cơ, thư giãn đầu óc với bài tập yoga nhẹ nhàng',
    thumbnail: 'https://i.ytimg.com/vi/Eml2xnoLpYE/maxresdefault.jpg',
    url: 'https://youtu.be/Eml2xnoLpYE',
    duration: '15:30',
    views: 8956,
    date: '2023-07-20'
  },
  {
    id: 'video3',
    title: 'Chăm sóc sức khỏe mùa nắng nóng',
    description: 'Những lời khuyên bổ ích để bảo vệ sức khỏe trong mùa hè',
    thumbnail: 'https://i.ytimg.com/vi/jNeqEJRQe9A/maxresdefault.jpg',
    url: 'https://youtu.be/jNeqEJRQe9A',
    duration: '08:45',
    views: 5621,
    date: '2023-08-05'
  }
];

export const localPlaylists = {
  exercise: {
    title: 'Tập thể dục',
    description: 'Các bài tập thể dục phù hợp với người cao tuổi',
    videos: [popularVideos[0], popularVideos[1]]
  },
  health: {
    title: 'Sức khỏe',
    description: 'Kiến thức về chăm sóc sức khỏe',
    videos: [popularVideos[2]]
  }
};
