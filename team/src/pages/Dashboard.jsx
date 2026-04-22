function Dashboard(){

  return(

    <div>

      <h1 className="text-2xl font-semibold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">
            Total Members
          </h3>
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">
            Events
          </h3>
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">
            Assignments
          </h3>
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>

      </div>

    </div>

  )

}

export default Dashboard