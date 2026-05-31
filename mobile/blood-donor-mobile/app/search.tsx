import { ProtectedScreen } from "@/components/auth/protected-screen";
import { SearchScreen } from "@/screens/search/search-screen";

export default function SearchRoute() {
  return (
    <ProtectedScreen requireCanSeek>
      <SearchScreen />
    </ProtectedScreen>
  );
}
