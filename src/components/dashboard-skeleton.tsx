import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Monthly Ribbon Skeleton */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {[...Array(14)].map((_, i) => (
                    <Skeleton key={i} className="h-24 min-w-[100px] rounded-2xl flex-shrink-0" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <Card className="rounded-[2.5rem] border shadow-2xl shadow-gray-200/50">
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent className="h-[400px] p-8">
                            <Skeleton className="h-full w-full rounded-3xl" />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-48 rounded-[2rem]" />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <Skeleton className="h-96 rounded-[2rem]" />
                    <Skeleton className="h-64 rounded-[2rem]" />
                </div>
            </div>
        </div>
    )
}
