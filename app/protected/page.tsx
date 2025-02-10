import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SuperAdminDashboard() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div >
      
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-[#004477] text-left">
            <th className="px-4 py-2 border-b">No</th>
            <th className="px-4 py-2 border-b">Full Name</th>
            <th className="px-4 py-2 border-b">Claim Category</th>
            <th className="px-4 py-2 border-b">Amount</th>
            <th className="px-4 py-2 border-b"></th>
            <th className="px-4 py-2 border-b">Approve</th>
            <th className="px-4 py-2 border-b">Deny</th>
          </tr>
        </thead>
        <tbody>
          {/* Example data rows */}
          <tr className="hover:bg-[#a4bee4]">
            <td className="px-4 py-2 border-b">1</td>
            <td className="px-4 py-2 border-b">John Doe</td>
            <td className="px-4 py-2 border-b">Travel</td>
            <td className="px-4 py-2 border-b">$1000</td>
            <td className="px-4 py-2 border-b"></td>
            <td className="px-4 py-2 border-b text-green-500">
              <input type="checkbox" className="h-5 w-5 text-green-500" />
            </td>
            <td className="px-4 py-2 border-b text-red-500">
              <input type="checkbox" className="h-5 w-5 text-red-500" />
            </td>
          </tr>
          
        </tbody>
      </table>
    </div>
  );
}

// export default async function ProtectedPage() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return redirect("/sign-in");
//   }

//   return (
//     <div className="flex-1 w-full flex flex-col gap-12">
//       <div className="w-full">
//         <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
//           <InfoIcon size="16" strokeWidth={2} />
//           This is a protected page that you can only see as an authenticated
//           user
//         </div>
//       </div>
//       <div className="flex flex-col gap-2 items-start">
//         <h2 className="font-bold text-2xl mb-4">Your user details</h2>
//         <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
//           {JSON.stringify(user, null, 2)}
//         </pre>
//       </div>
//       <div>
//         <h2 className="font-bold text-2xl mb-4">Next steps</h2>
//         <FetchDataSteps />
//       </div>
//     </div>
//   );
// }
