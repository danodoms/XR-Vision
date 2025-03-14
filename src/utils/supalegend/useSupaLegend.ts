import { enableReactTracking } from "@legendapp/state/config/enableReactTracking";
import {createResultsObservable, addResult as _addResult, ResultsObservable} from "@/src/utils/supalegend/SupaLegend";
import { useSession } from "@/src/hooks/useSession";
import { useEffect, useState } from "react";
import {useObservable} from "@legendapp/state/react";
import {observable} from "@legendapp/state";


enableReactTracking({
  auto: true,
});

// Singleton for results observable
const results$ = observable<ResultsObservable>();

// Function to initialize results observable
function initializeResults(user_id:string) {
  if (!results$.get()) {
    results$.set(createResultsObservable(user_id));
  }
}

// Function to aggregate and sort classifications
function aggregateAndSortClassifications(data:any) {
  const values = Object.values(data);

  const aggregated:any = values.reduce((acc:any, item:any):any => {
    if (!acc[item.classification]) {
      acc[item.classification] = {
        classification: item.classification,
        count: 0,
      };
    }
    acc[item.classification].count += 1; // Increment count
    return acc;
  }, {});

  return Object.values(aggregated).sort((a:any, b:any) => b.count - a.count);
}



// Hook to manage SupaLegend logic
export const useSupaLegend = () => {
  console.log("useSupaLegend");

  const session = useSession();
  const user_id = session?.user.id || "noUserId";

  // Initialize the results observable only once during app load
  useEffect(() => {
    initializeResults(user_id);
  }, [user_id]); // Ensure user_id is passed, but the observable itself is static

  const results = Object.values(observable(results$).get() || {});   // Convert observable data to array format
  const topClassifications = aggregateAndSortClassifications(results);  // Aggregate and sort classifications

  // Function to clear results
  const clearResults = () => {
    results$.delete();
  };

  // Function to add a result
  const addResult = (capturedImageUri:string, classification:string, confidence:number) => {
    _addResult(results$, capturedImageUri, classification, confidence, user_id);
  };

  return { results, topClassifications, clearResults, addResult };
};
