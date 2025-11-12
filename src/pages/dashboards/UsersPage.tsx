{showDetailModal && selectedProfile && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl my-10 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
      {/* Header / Cover */}
      <div className="relative h-36 md:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,white,transparent_60%)]" />
        <button
          onClick={() => setShowDetailModal(false)}
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Top identity row */}
      <div className="px-6 md:px-8 -mt-12 md:-mt-14">
        <div className="flex flex-col md:flex-row md:items-end gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            {selectedProfile.photo_url ? (
              <img
                src={selectedProfile.photo_url}
                alt="Profile"
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-900 shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-white dark:ring-gray-900 shadow-xl flex items-center justify-center">
                <span className="text-white text-4xl md:text-5xl font-bold">
                  {selectedProfile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {selectedProfile.full_name}
              </h2>

              {/* Role badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(
                  selectedProfile.role
                )}`}
              >
                {selectedProfile.role}
                {selectedProfile.sub_role ? ` • ${selectedProfile.sub_role}` : ''}
              </span>

              {/* Status badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                  selectedProfile.status
                )}`}
              >
                {selectedProfile.status}
              </span>

              {/* House badge, if any */}
              {selectedProfile.house && (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getHouseBadgeColor(
                    selectedProfile.house
                  )}`}
                >
                  <Home className="h-3.5 w-3.5" />
                  {selectedProfile.house} House
                </span>
              )}
            </div>

            {/* Email quick glance */}
            <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm break-all">
              {selectedProfile.email}
            </p>

            {/* Duties chips */}
            {Array.isArray(selectedProfile.duties) &&
              selectedProfile.duties.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {selectedProfile.duties.map((duty, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm"
                    >
                      {duty}
                    </span>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: contact + identifiers */}
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Contact
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300 break-all">
                    {selectedProfile.email || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedProfile.phone || 'N/A'}
                  </span>
                </div>
                {selectedProfile.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedProfile.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <IdCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Identifiers
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Admission No</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedProfile.admission_no || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Employee ID</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedProfile.employee_id || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">User ID</span>
                  <span className="text-gray-900 dark:text-white break-all">
                    {selectedProfile.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle column: personal info */}
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div className="text-gray-600 dark:text-gray-400">DOB</div>
                  <div className="ml-auto text-gray-900 dark:text-white">
                    {selectedProfile.date_of_birth
                      ? new Date(selectedProfile.date_of_birth).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-gray-500" />
                  <div className="text-gray-600 dark:text-gray-400">Blood Group</div>
                  <div className="ml-auto text-gray-900 dark:text-white">
                    {selectedProfile.blood_group || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-gray-500" />
                  <div className="text-gray-600 dark:text-gray-400">Gender</div>
                  <div className="ml-auto text-gray-900 dark:text-white capitalize">
                    {selectedProfile.gender || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-gray-500" />
                  <div className="text-gray-600 dark:text-gray-400">Approval</div>
                  <div className="ml-auto text-gray-900 dark:text-white capitalize">
                    {selectedProfile.approval_status || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div className="text-gray-600 dark:text-gray-400">Joined</div>
                  <div className="ml-auto text-gray-900 dark:text-white">
                    {selectedProfile.created_at
                      ? new Date(selectedProfile.created_at).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Parent / Guardian
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-gray-500" />
                  <div className="text-gray-600 dark:text-gray-400">Name</div>
                  <div className="ml-auto text-gray-900 dark:text-white">
                    {selectedProfile.parent_name || 'N/A'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div className="text-gray-600 dark:text-gray-400">Phone</div>
                  <div className="ml-auto text-gray-900 dark:text-white">
                    {selectedProfile.parent_phone || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: actions (kept your existing logic) */}
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Actions
              </h4>
              <div className="flex flex-col gap-2">
                {selectedProfile.role === 'student' &&
                  (currentProfile?.sub_role === 'head' ||
                    currentProfile?.sub_role === 'principal') && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setShowTCModal(selectedProfile);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Generate Transfer Certificate
                    </button>
                  )}

                {(currentProfile?.sub_role === 'head' ||
                  currentProfile?.sub_role === 'principal') && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowHouseDutiesModal(selectedProfile);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    <Award className="h-4 w-4" />
                    Edit House & Duties
                  </button>
                )}

                {canEditUser(selectedProfile) && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditClick(selectedProfile);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit User
                  </button>
                )}

                {canDeleteUser(selectedProfile) && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowConfirmModal({
                        type: 'delete',
                        profile: selectedProfile,
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </button>
                )}
              </div>
            </div>

            {/* Audit card */}
            <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-sm">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Audit
              </h4>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Approved At</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedProfile.approved_at
                      ? new Date(selectedProfile.approved_at).toLocaleString()
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Approved By</span>
                  <span className="text-gray-900 dark:text-white break-all">
                    {selectedProfile.approved_by || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Updated</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedProfile.updated_at
                      ? new Date(selectedProfile.updated_at).toLocaleString()
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 pb-6 px-6 md:px-8 flex justify-end">
          <button
            onClick={() => setShowDetailModal(false)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
