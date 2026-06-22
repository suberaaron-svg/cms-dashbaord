import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-lg font-semibold">Social CMS Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Head to the Analytics page to review content performance across
            all of your connected platforms.
          </p>
          <Button asChild>
            <Link href="/analytics">View Analytics</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
