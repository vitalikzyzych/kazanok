import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "primereact/button";

import {
  daysSince,
  formatMinutes,
  greeting,
  type IRecipe,
  pickForToday,
} from "@/domain";
import { FluentIcon, RecipeCover } from "@/ui";
import { countLabel, DAYS } from "@/utils";

/** "Що приготуємо?": one suggestion, "Інша ідея" shows the next one. */
const TodayCard = ({ recipes }: { recipes: IRecipe[] }) => {
  const [skip, setSkip] = useState(0);
  const navigate = useNavigate();
  const now = new Date();
  const r = pickForToday(recipes, now, skip);
  if (!r) return null;

  const days = daysSince(r.lastCookedAt, now.getTime());
  const why = `${
    days === null ? "Ще не готували" : `Готували ${countLabel(days, DAYS)} тому`
  }, ${formatMinutes(r.totalMin)}`;

  return (
    <section className="today" aria-label="Ідея на сьогодні">
      <div className="min-w-0">
        <span className="today__kicker">
          {greeting(now.getHours())}, що приготуємо?
        </span>
        <h2>
          <Link to={`/recipes/${r.id}`}>{r.title}</Link>
        </h2>
        <p className="today__why">{why}</p>
        <div className="today__row">
          <Button
            label="Відкрити рецепт"
            onClick={() => navigate(`/recipes/${r.id}`)}
          />
          <Button
            label="Інша ідея"
            outlined
            severity="secondary"
            icon={<FluentIcon name="ArrowCounterclockwise" size={20} />}
            onClick={() => setSkip((s) => s + 1)}
          />
        </div>
      </div>
      <Link className="today__pic" to={`/recipes/${r.id}`} aria-label={r.title}>
        <RecipeCover seed={r.id} photoId={r.photoId} />
      </Link>
    </section>
  );
};

export default TodayCard;
