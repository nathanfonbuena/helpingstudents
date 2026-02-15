"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/app/components/ToastProvider";

interface FollowButtonProps {
  professorId: string;
  professorSlug: string;
  initialFollowing: boolean;
  onClick?: () => void;
}

export default function FollowButton({
  professorId,
  professorSlug,
  initialFollowing,
  onClick
}: FollowButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const toast = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    onClick?.();
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/professor/${professorSlug}`);
      return;
    }

    setLoading(true);
    const response = await fetch("/api/follow", {
      method: following ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: professorId })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      toast.push(payload.error ?? "Unable to update follow status.", "error");
      return;
    }

    const payload = (await response.json()) as { following?: boolean };
    const nextFollowing = payload.following ?? !following;
    setFollowing(nextFollowing);
    toast.push(
      nextFollowing ? "Professor followed." : "Professor unfollowed.",
      "success"
    );
  };

  return (
    <button
      className="ghost-button"
      type="button"
      onClick={toggleFollow}
      disabled={loading}
    >
      {loading ? "Saving..." : following ? "Following" : "Follow"}
    </button>
  );
}
