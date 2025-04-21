import AsyncStorage from '@react-native-async-storage/async-storage';

export class VideoService {
  static async searchVideos(query) {
    try {
      // Tìm trong cache trước
      const cachedResults = await this.getFromCache(query);
      if (cachedResults) return cachedResults;

      // Trả về mẫu dữ liệu hardcoded
      const results = this.getDefaultVideos().filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase())
      );
      
      if (results.length > 0) {
        await this.saveToCache(query, results);
        return results;
      }

      return this.getDefaultVideos().slice(0, 2);
    } catch (error) {
      console.error('Search error:', error);
      return this.getDefaultVideos();
    }
  }

  static getDefaultVideos() {
    return [
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
  }

  static async getFromCache(query) {
    try {
      const cached = await AsyncStorage.getItem(`search_${query}`);
      if (cached) {
        const { results, timestamp } = JSON.parse(cached);
        // Cache có hiệu lực trong 24 giờ
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return results;
        }
      }
      return null;
    } catch (error) {
      console.error('Cache error:', error);
      return null;
    }
  }

  static async saveToCache(query, results) {
    try {
      await AsyncStorage.setItem(`search_${query}`, JSON.stringify({
        results,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  static async getAudioUrl(videoId) {
    try {
      const info = await ytdl.getInfo(videoId);
      const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      return format.url;
    } catch (error) {
      console.error('Error getting audio URL:', error);
      return null;
    }
  }
}
