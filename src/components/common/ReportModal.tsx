'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { reportService } from '@/services/report.service';
import { ReportTargetType } from '@/types/report';
import { toast } from 'sonner'; // Assuming sonner is used for toasts, standard for shadcn templates today

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: string;
  triggerElement: React.ReactNode;
}

export function ReportModal({ targetType, targetId, triggerElement }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do báo cáo');
      return;
    }

    try {
      setIsSubmitting(true);
      await reportService.createReport({
        targetType,
        targetId,
        reason: reason.trim(),
      });
      
      toast.success('Báo cáo của bạn đã được gửi thành công!');
      setIsOpen(false);
      setReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px] bg-[#262626] text-zinc-100 border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Báo cáo vi phạm</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Hãy cho chúng tôi biết lý do bạn muốn báo cáo nội dung này. Quản trị viên sẽ xem xét và xử lý.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea 
            placeholder="Nhập lý do báo cáo..." 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px] bg-[#1F1F1F] border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)} 
            disabled={isSubmitting}
            className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
