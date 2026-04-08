import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader, FileText, Video, Type, CheckCircle } from 'lucide-react';
import { lessonsService, type Lesson, ContentType } from '../services/lessonsService';
import { enrollmentsService } from '../services/enrollmentsService';
import AppLayout from '../components/layout/AppLayout';

export const LessonViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLesson(id);
    }
  }, [id]);

  const fetchLesson = async (lessonId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await lessonsService.getLessonById(lessonId);
      setLesson(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load lesson';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson) return;
    try {
      setCompleting(true);
      await enrollmentsService.markLessonComplete(lesson.id);
      setCompleted(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to mark lesson complete';
      alert(errorMsg);
    } finally {
      setCompleting(false);
    }
  };

  const getVideoEmbedUrl = (url: string): string | null => {
    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    
    // Vimeo
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return null;
  };

  const renderContent = () => {
    if (!lesson) return null;

    switch (lesson.contentType) {
      case ContentType.VIDEO:
        const embedUrl = getVideoEmbedUrl(lesson.contentUrl);
        
        if (embedUrl) {
          return (
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700/50">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.title}
              ></iframe>
            </div>
          );
        }

        return (
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700/50">
            <video
              src={lesson.contentUrl}
              controls
              className="w-full h-full"
            >
              <source src={lesson.contentUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case ContentType.DOCUMENT:
        return (
          <div className="bg-slate-800/60 rounded-xl p-8 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="text-white font-bold text-lg">Document Resource</h3>
                <p className="text-slate-400 text-sm">Click below to open the document</p>
              </div>
            </div>
            <a
              href={lesson.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition shadow-lg shadow-emerald-500/20"
            >
              <FileText className="w-5 h-5" />
              Open Document
            </a>
          </div>
        );
      case ContentType.TEXT:
      default:
        return (
          <div className="bg-slate-800/60 rounded-xl p-8 border border-slate-700/50">
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {lesson.contentUrl}
              </div>
            </div>
          </div>
        );
    }
  };

  const getContentIcon = () => {
    switch (lesson?.contentType) {
      case ContentType.VIDEO: return <Video className="w-5 h-5 text-primary-teal" />;
      case ContentType.DOCUMENT: return <FileText className="w-5 h-5 text-emerald-400" />;
      case ContentType.TEXT: return <Type className="w-5 h-5 text-purple-400" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="w-10 h-10 text-primary-teal animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !lesson) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Lesson not found'}</p>
          <button onClick={() => navigate(-1)} className="text-primary-teal hover:text-primary-teal/70 mt-4 inline-block text-sm font-semibold">
            ← Go Back
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <button onClick={() => navigate(-1)} className="hover:text-white transition flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        {lesson.module && (
          <>
            <span>/</span>
            <Link to={`/courses/${lesson.module.courseId}`} className="hover:text-white transition">
              Course
            </Link>
            <span>/</span>
            <span className="text-slate-500">{lesson.module.title}</span>
          </>
        )}
        <span>/</span>
        <span className="text-white font-medium truncate">{lesson.title}</span>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Lesson Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            {getContentIcon()}
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lesson.contentType} Lesson
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
        </div>

        {/* Lesson Content */}
        <div className="mb-8">
          {renderContent()}
        </div>

        {/* Mark Complete Button */}
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-lg">
              {completed ? 'Lesson Completed! 🎉' : 'Finished this lesson?'}
            </h3>
            <p className="text-slate-400 text-sm mt-0.5">
              {completed
                ? 'Great job! Your progress has been updated.'
                : 'Mark it complete to track your progress.'}
            </p>
          </div>
          <button
            onClick={handleMarkComplete}
            disabled={completing || completed}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition shadow-lg text-sm ${
              completed
                ? 'bg-emerald-500/20 text-emerald-400 cursor-default shadow-none border border-emerald-500/30'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            {completed ? 'Completed' : completing ? 'Marking...' : 'Mark Complete'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonViewerPage;
