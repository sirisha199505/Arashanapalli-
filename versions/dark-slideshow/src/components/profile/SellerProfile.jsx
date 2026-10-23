import { COMPANY } from '../../data/catalog';
import { getFacts } from '../../utils/catalog';
import { Card, FactList, Logo } from '../ui';

const PROFILE_FACTS = getFacts('owner', 'businessType', 'established', 'employees', 'turnover', 'workingDays', 'phone', 'address');

export default function SellerProfile() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Logo className="h-14 w-14" />
        <div>
          <h2 className="text-xl font-bold">About {COMPANY.name}</h2>
          <p className="text-sm text-muted">{COMPANY.tagline}</p>
        </div>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{COMPANY.about}</p>
      <FactList facts={PROFILE_FACTS} className="mt-6 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4" />
    </Card>
  );
}
