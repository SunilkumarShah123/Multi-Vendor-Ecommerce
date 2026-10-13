import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Pagewrapper from "../Pagewrapper";

function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query") || "";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      if (!query.trim()) {
        setCourses([]);
        setError("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await apiInstance.get("search/", {
          params: { query },
        });
        setCourses(
          Array.isArray(response.data)
            ? response.data
            : response.data?.results || [],
        );
      } catch (error) {
        console.error("Search error:", error);
        setCourses([]);
        setError("Unable to load search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [query]);

  return (
    <Pagewrapper>
      <div className="container py-4">
        <h3>Search Results</h3>
        {query && (
          <p>
            Results for: <strong>{query}</strong>
          </p>
        )}

        {loading && <p>Loading courses...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && query && courses.length === 0 && (
          <p>No matching courses found.</p>
        )}

        <div className="row g-3">
          {courses.map((course) => (
            <div className="col-md-6 col-lg-4" key={course.id}>
              <button
                type="button"
                className="card h-100 w-100 text-start shadow-sm p-0"
                onClick={() => navigate(`/course-detail/${course.slug}`)}
              >
                {course.image && (
                  <img
                    src={course.image}
                    className="card-img-top"
                    alt={course.title}
                    style={{ height: 180, objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text text-muted">{course.description}</p>
                  <h6 className="text-success">Rs. {course.price}</h6>
                  <span className="text-primary">View course →</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </Pagewrapper>
  );
}

export default Search;
