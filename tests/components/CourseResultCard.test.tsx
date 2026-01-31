import { render, screen } from "@testing-library/react";
import CourseResultCard from "@/app/components/search/CourseResultCard";
import courses from "@/tests/fixtures/courses.json";

jest.mock("@/app/components/SaveCourseButton", () => ({
  __esModule: true,
  default: () => <button>Save</button>
}));

describe("CourseResultCard", () => {
  it("renders course info", () => {
    const course = courses[0];
    render(
      <CourseResultCard
        id={course.id}
        courseNumber={course.courseNumber}
        name={course.name}
        professorName="Dr. Chen"
        initialSaved={false}
      />
    );
    expect(screen.getByText(/CS-101/)).toBeInTheDocument();
  });
});
