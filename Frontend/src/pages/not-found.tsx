
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardContent className="p-8 text-center">

          <div className="flex justify-center mb-5">
            <div className="rounded-full bg-red-100 p-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900">
            404
          </h1>

          <h2 className="mt-2 text-xl font-semibold">
            Page Not Found
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Sorry, the page you are looking for doesn't exist
            or may have been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button asChild className="flex-1">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
