import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PLATFORM_META } from "@/lib/metricool/platform-meta";
import type { TopPost } from "@/types/analytics";

interface TopPostsTableProps {
  data: TopPost[];
}

export function TopPostsTable({ data }: TopPostsTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No posts found for this date range and platform.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Engagement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((post) => {
              const meta = PLATFORM_META[post.platform];
              return (
                <TableRow key={post.id}>
                  <TableCell className="max-w-[260px] truncate font-medium">
                    {post.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{ color: meta.color, borderColor: meta.color }}
                    >
                      {meta.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.publishDate}
                  </TableCell>
                  <TableCell className="text-right">
                    {post.impressions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {post.likes.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {post.comments.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {post.shares.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {post.engagementRate}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
