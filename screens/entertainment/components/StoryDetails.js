import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import styles from '../StoryDetailScreen.styles';

export const StoryDetails = ({ story }) => (
  <View style={styles.detailsContainer}>
    <View style={styles.contentSection}>
      <View style={styles.descriptionHeader}>
        <MaterialCommunityIcons name="text-box" size={20} color={colors.primary} />
        <Text style={styles.sectionTitle}>Giới thiệu</Text>
      </View>
      <Text style={styles.description}>{story.description}</Text>
    </View>

    <View style={styles.contentSection}>
      <View style={styles.detailsWrapper}>
        <DetailItem 
          icon="bookmark-outline"
          label="Thể loại"
          value={story.genre}
          color={colors.primary}
        />
        <DetailItem 
          icon="clock-outline"
          label="Cập nhật"
          value={story.lastUpdated}
        />
        <DetailItem 
          icon="chart-timeline-variant"
          label="Trạng thái"
          value={story.status === 'Completed' ? 'Hoàn thành' : 'Đang cập nhật'}
          badge
          color={story.status === 'Completed' ? colors.success : colors.primary}
        />
        <DetailItem 
          icon="text"
          label="Số từ"
          value={`${(story.wordCount || 0).toLocaleString()} từ`}
        />
        <DetailItem 
          icon="book-open-page-variant"
          label="Thời gian đọc"
          value={`${Math.ceil((story.wordCount || 0) / 200)} phút`}
          isLast
        />
      </View>
    </View>

    {story.tags?.length > 0 && (
      <View style={styles.contentSection}>
        <View style={styles.descriptionHeader}>
          <MaterialCommunityIcons name="tag-multiple" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Thể loại</Text>
        </View>
        <View style={styles.tagsRow}>
          {story.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    )}
  </View>
);

const DetailItem = ({ icon, label, value, badge, color, isLast }) => (
  <View style={[styles.detailItem, isLast && styles.detailItemLast]}>
    <View style={styles.detailIconLabel}>
      <MaterialCommunityIcons 
        name={icon} 
        size={20} 
        color={color || colors.grey}
        style={styles.detailIcon}
      />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    {badge ? (
      <View style={[styles.statusBadge, { backgroundColor: `${color}15` }]}>
        <Text style={[styles.statusText, { color }]}>{value}</Text>
      </View>
    ) : (
      <Text style={[
        styles.detailValue,
        color && { color }
      ]}>
        {value || 'Không xác định'}
      </Text>
    )}
  </View>
);
