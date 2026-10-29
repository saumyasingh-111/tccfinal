import React, { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  fetchAdminReviews,
  moderateReview,
  deleteReview,
  type ReviewRecord,
} from "../../services/adminService";
import { useToast } from "../../context/ToastContext";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

export const AdminReviewsPage: React.FC = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  const loadReviews = async () => {
    setIsLoading(true);
    const data = await fetchAdminReviews();
    setReviews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerate = async (id: string, status: "approved" | "rejected") => {
    const ok = await moderateReview(id, status);
    if (ok) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      showToast(`Review marked as ${status}.`);
    } else {
      showToast("Failed to update review status.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this customer review permanently?")) {
      const ok = await deleteReview(id);
      if (ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        showToast("Review deleted.");
      } else {
        showToast("Failed to delete review.", "error");
      }
    }
  };

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchRating = ratingFilter === "all" || r.rating === ratingFilter;
      return matchStatus && matchRating;
    });
  }, [reviews, statusFilter, ratingFilter]);

  // Aggregate KPIs
  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";

  return (
    <AdminLayout
      pageTitle="Customer Reviews &amp; Moderation"
      pageSubtitle="Moderate customer feedback, approve testimonials for the public website, and track cafe ratings."
      actions={
        <button
          onClick={() => {
            loadReviews();
            showToast("Reviews refreshed.");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#162820] hover:bg-[#FAF6F0] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs border border-[#E2D9CC] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      }
    >
      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Total Reviews
            </span>
            <span className="font-serif text-3xl font-bold text-[#1C241E]">
              {totalReviews}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">From verified customers</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FAF6F0] border border-[#E5DFD5] flex items-center justify-center text-[#26332A]">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Average Rating
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-3xl font-bold text-[#C59F54]">
                {averageRating}
              </span>
              <span className="text-xs text-[#767E7A]">/ 5.0</span>
            </div>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Overall customer score</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C59F54]">
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block mb-1">
              Pending Moderation
            </span>
            <span className="font-serif text-3xl font-bold text-amber-700">
              {pendingCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Requires approval</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block mb-1">
              Live on Website
            </span>
            <span className="font-serif text-3xl font-bold text-emerald-700">
              {approvedCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Approved testimonials</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {["all", "pending", "approved", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#0F3A23] text-white shadow-2xs"
                  : "bg-[#FAF6F0] text-[#755546] hover:bg-[#EFE9DE]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Rating Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-semibold text-[#767E7A] mr-1">
            Stars:
          </span>
          <button
            onClick={() => setRatingFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              ratingFilter === "all" ? "bg-[#0F3A23] text-white" : "bg-[#FAF6F0] text-[#755546]"
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setRatingFilter(stars)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                ratingFilter === stars ? "bg-[#0F3A23] text-white" : "bg-[#FAF6F0] text-[#755546]"
              }`}
            >
              <span>{stars}</span>
              <Star className="w-3 h-3 fill-current text-amber-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#E5DFD5] p-12 text-center text-xs text-[#767E7A]">
            <div className="w-6 h-6 border-2 border-[#0F3A23] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading reviews from Firestore...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5DFD5] p-12 text-center text-xs text-[#767E7A] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#A39B8E] mx-auto opacity-50" />
            <p className="font-medium text-[#1C241E]">No reviews found matching filter.</p>
            <p className="font-light">
              Customer reviews submitted on the website will appear here for your moderation.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            let statusBadge = "bg-amber-50 text-amber-800 border-amber-200";
            if (rev.status === "approved") {
              statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
            } else if (rev.status === "rejected") {
              statusBadge = "bg-rose-50 text-rose-800 border-rose-200";
            }

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs p-5 transition-all hover:border-[#D1C7BA]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E5DFD5] flex items-center justify-center font-bold text-sm text-[#0F3A23]">
                      {rev.customerName.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1C241E]">
                          {rev.customerName}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge}`}
                        >
                          {rev.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#767E7A]">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {rev.status !== "approved" && (
                      <button
                        onClick={() => handleModerate(rev.id, "approved")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                    {rev.status !== "rejected" && (
                      <button
                        onClick={() => handleModerate(rev.id, "rejected")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-semibold transition-all cursor-pointer border border-[#E5DFD5]"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 text-[#767E7A] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#3E4340] leading-relaxed bg-[#FCFAF7] p-3.5 rounded-xl border border-[#EFE9DE]">
                  "{rev.comment}"
                </p>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
};
