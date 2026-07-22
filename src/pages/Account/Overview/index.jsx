const pendingActions = [
  { count: "12", text: "products waiting for review" },
  { count: "1", text: "return request under review" },
  { count: "2", text: "custom hair quote awaiting response" },
  { count: "1", text: "skincare consultation response available" },
];

function Card({ title, children, className = "" }) {
  return (
    <div
      className={`flex flex-col border border-[#dadde2] px-5 py-4 ${className}`}
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-[16px] font-semibold leading-[1.4] text-black">
          {title}
        </h2>
        <span className="h-px w-full bg-[#dadde2]" />
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[14px] font-medium">
      <span className="text-[#667085]">{label}</span>
      <span className="text-black">{value}</span>
    </div>
  );
}

function Overview() {
  return (
    <div className="flex flex-col gap-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="flex flex-wrap items-center gap-2 text-[18px] font-semibold leading-[1.4]">
          <span className="text-black">Welcome back,</span>
          <span className="text-(--primary-color)">Desmond</span>
        </h1>
        <p className="text-[14px] text-[#667085]">
          Here&rsquo;s a quick look at your latest account activity.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-10 md:gap-y-6">
        {/* Account Details */}
        <Card title="Account Details" className="gap-4">
          <div className="mt-1 flex flex-col gap-3">
            <DetailRow label="Name" value="Desmond Jumbo" />
            <DetailRow label="Email" value="desmond@zeedara.com" />
            <DetailRow label="Phone number" value="+234 xxx xxx xxxx" />
          </div>
        </Card>

        {/* Default Delivery Address */}
        <Card title="Default Delivery Address" className="justify-between gap-4">
          <p className="mt-1 text-[14px] font-medium leading-[1.4] text-[#667085]">
            No delivery address saved yet.
            <br />
            Add an address to checkout faster next time.
          </p>
          <button
            type="button"
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[14px] font-semibold text-(--primary-color) transition-colors hover:bg-[#f3e7d2]"
          >
            ADD ADDRESS
          </button>
        </Card>

        {/* Most Recent Order */}
        <Card title="Most Recent Order" className="justify-between gap-4">
          <p className="mt-1 text-[16px] font-medium text-black">Order #ZD1024</p>
          <div className="flex items-end justify-between gap-4">
            <p className="text-[14px] font-medium leading-[1.4] text-[#667085]">
              Placed on 12 June 2026
              <br />
              Status: Shipped
              <br />
              Total: &#8358;45,000
            </p>
            <div className="flex shrink-0 gap-3 text-[14px] font-semibold text-(--primary-color)">
              <button type="button" className="cursor-pointer underline">
                Track Order
              </button>
              <button type="button" className="cursor-pointer underline">
                Edit Address
              </button>
            </div>
          </div>
        </Card>

        {/* Pending Actions */}
        <Card title="Pending Actions" className="gap-3">
          <div className="mt-1 flex flex-col gap-3 text-[14px] font-medium text-[#667085]">
            {pendingActions.map(({ count, text }) => (
              <p key={text} className="leading-[1.4]">
                <span className="font-semibold text-(--primary-color)">
                  {count}
                </span>{" "}
                {text}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Overview;
