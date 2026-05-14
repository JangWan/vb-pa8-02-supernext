"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  firstName: z.string().min(1, "이름을 입력해주세요."),
  lastName: z.string().min(1, "성을 입력해주세요."),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfileTab() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      });
    }
  }, [user, reset]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);
    setUploadError(null);

    try {
      await user.setProfileImage({ file });
      await user.reload();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "이미지 업로드에 실패했습니다."
      );
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    await user.update({ firstName: data.firstName, lastName: data.lastName });
    reset({ firstName: data.firstName, lastName: data.lastName });
  };

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  const avatarSrc = previewUrl ?? user?.imageUrl;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-base font-semibold text-slate-900">프로필 수정</p>
        <p className="mt-1 text-sm text-slate-500">
          이름과 프로필 이미지를 변경할 수 있습니다.
        </p>
      </div>

      {/* 아바타 업로드 */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarSrc} alt="프로필" />
            <AvatarFallback className="bg-slate-100 text-lg font-medium text-slate-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">프로필 사진</p>
          <p className="text-xs text-slate-400">
            {isUploading ? "업로드 중..." : "PNG, JPG, WEBP · 최대 10MB"}
          </p>
          {uploadError && (
            <p className="text-xs text-rose-500">{uploadError}</p>
          )}
        </div>
      </div>

      {/* 이름 수정 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-slate-700">
          이름
          <input
            {...register("firstName")}
            placeholder="이름"
            className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
          {errors.firstName && (
            <p className="text-xs text-rose-500">{errors.firstName.message}</p>
          )}
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-700">
          성
          <input
            {...register("lastName")}
            placeholder="성"
            className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
          {errors.lastName && (
            <p className="text-xs text-rose-500">{errors.lastName.message}</p>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="self-end rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
