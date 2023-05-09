export default function PageTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-t border-gray-200 pb-4 pl-4 pr-6 pt-4 sm:pl-6 lg:pl-8 xl:border-t-0 xl:pl-6 xl:pt-6">
      <div className="flex items-center">
        <h1 className="flex-1 text-lg font-medium">{title}</h1>
      </div>
    </div>
  );
}
