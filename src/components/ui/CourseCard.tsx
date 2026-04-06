import { BookOpen, Users, Clock, Star, Play } from 'lucide-react';
import { Card } from './index';
import { Badge } from './index';

export interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  students: number;
  lessons: number;
  duration: number;
  rating: number;
  price: number;
  isFavorite?: boolean;
  isEnrolled?: boolean;
  onClick?: () => void;
}

export function CourseCard({
  title,
  description,
  instructor,
  level,
  students,
  lessons,
  duration,
  rating,
  price,
  isEnrolled,
  onClick,
}: CourseCardProps) {
  return (
    <Card hover onClick={onClick} className="overflow-hidden group">
      {/* Header with thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay"></div>
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-dark-800/80 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
            <Play size={24} className="text-primary-400 ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="primary">{level}</Badge>
          {isEnrolled && <Badge variant="success">Enrolled</Badge>}
        </div>

        {/* Title and description */}
        <div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
        </div>

        {/* Instructor */}
        <div className="text-sm text-gray-400 py-3 border-y border-dark-700/50">
          by <span className="text-gray-200 font-semibold">{instructor}</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={16} />
            <span>{students}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen size={16} />
            <span>{lessons}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={16} />
            <span>{duration}h</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 py-3 border-top border-dark-700/50">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">({rating})</span>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-700/50">
          <div className="font-semibold">
            ${price}
            {price === 0 && <span className="text-sm text-gray-400 ml-1">Free</span>}
          </div>
          <button className="btn btn-primary btn-sm">
            {isEnrolled ? 'Continue' : 'Enroll'}
          </button>
        </div>
      </div>
    </Card>
  );
}

interface CourseGridProps {
  courses: CourseCardProps[];
  loading?: boolean;
  onCourseClick?: (courseId: string) => void;
}

export function CourseGrid({ courses, onCourseClick }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="py-12 text-center">
        <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400">No courses found</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          {...course}
          onClick={() => onCourseClick?.(course.id)}
        />
      ))}
    </div>
  );
}
