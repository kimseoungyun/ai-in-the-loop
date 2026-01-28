"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Clock, Bell } from "lucide-react";

interface Schedule {
  id: string;
  day: string;
  time: string;
}

const DAYS = [
  { value: "monday", label: "월요일" },
  { value: "tuesday", label: "화요일" },
  { value: "wednesday", label: "수요일" },
  { value: "thursday", label: "목요일" },
  { value: "friday", label: "금요일" },
  { value: "saturday", label: "토요일" },
  { value: "sunday", label: "일요일" },
  { value: "weekdays", label: "평일" },
  { value: "everyday", label: "매일" },
];

const TIMES = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

export function NotificationSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([
    { id: "1", day: "weekdays", time: "08:00" },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newDay, setNewDay] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleAdd = () => {
    if (newDay && newTime) {
      setSchedules([
        ...schedules,
        { id: Date.now().toString(), day: newDay, time: newTime },
      ]);
      setNewDay("");
      setNewTime("");
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleUpdate = (id: string, field: "day" | "time", value: string) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Bell className="h-4 w-4" />
          알림 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3"
          >
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Select
              value={schedule.day}
              onValueChange={(value) => handleUpdate(schedule.id, "day", value)}
            >
              <SelectTrigger className="h-8 w-24 border-0 bg-card text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={schedule.time}
              onValueChange={(value) =>
                handleUpdate(schedule.id, "time", value)
              }
            >
              <SelectTrigger className="h-8 w-20 border-0 bg-card text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMES.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(schedule.id)}
              className="ml-auto h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Select value={newDay} onValueChange={setNewDay}>
              <SelectTrigger className="h-8 w-24 text-sm">
                <SelectValue placeholder="요일" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newTime} onValueChange={setNewTime}>
              <SelectTrigger className="h-8 w-20 text-sm">
                <SelectValue placeholder="시간" />
              </SelectTrigger>
              <SelectContent>
                {TIMES.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-1">
              <Button size="sm" className="h-8" onClick={handleAdd}>
                추가
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => {
                  setIsAdding(false);
                  setNewDay("");
                  setNewTime("");
                }}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full border-dashed"
          >
            <Plus className="mr-1 h-4 w-4" />
            알림 시간 추가
          </Button>
        )}

        <p className="pt-2 text-xs text-muted-foreground">
          설정한 시간에 관심 종목의 AI 리포트를 이메일로 받아보세요.
        </p>
      </CardContent>
    </Card>
  );
}
