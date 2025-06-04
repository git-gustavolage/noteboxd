export default function DotsGrid(props: React.SVGProps<SVGSVGElement>) {

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="12" r="1"></circle>
      <circle cx="8" cy="6" r="1"></circle>
      <circle cx="8" cy="18" r="1"></circle>
      <circle cx="15" cy="12" r="1"></circle>
      <circle cx="15" cy="6" r="1"></circle>
      <circle cx="15" cy="18" r="1"></circle>
    </svg>
  )
}