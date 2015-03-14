//
//  ViewController.swift
//  Next
//
//  Created by Hannes Waller on 2015-03-14.
//  Copyright (c) 2015 Hannes Waller. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    @IBOutlet weak var tableView: UITableView!
    
    var lines: [Departure] = [Departure(lineNumber: "17", lineDestination: "Rikshospitalet", timeToDeparture: "2", imageType: "trikk"),
                Departure(lineNumber: "20", lineDestination: "Skøyen", timeToDeparture: "5", imageType: "buss"),
                Departure(lineNumber: "25", lineDestination: "Majorstuen", timeToDeparture: "9", imageType: "buss")]
    
    override func viewDidLoad() {
        super.viewDidLoad()

    }

    override func viewWillAppear(animated: Bool) {
        
        tableView.registerClass(UITableViewCell.self, forCellReuseIdentifier: "cell")
        tableView.separatorInset = UIEdgeInsetsMake(0.0, 0.0, 0.0, 0.0)
        tableView.layoutMargins = UIEdgeInsetsMake(0.0, 0.0, 0.0, 0.0)
        var tblView = UIView(frame: CGRectZero)
        tableView.tableFooterView = tblView
        tableView.tableFooterView?.hidden = true
        tableView.backgroundColor = UIColor(r: 208, g: 204, b: 204)
        
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    override func preferredStatusBarStyle() -> UIStatusBarStyle {
        return UIStatusBarStyle.LightContent
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return lines.count;
    }
    
    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        
        var cell:DepartureTableViewCell = self.tableView.dequeueReusableCellWithIdentifier("customCell") as DepartureTableViewCell!
        
        var dep: Departure = lines[indexPath.row]
        cell.loadItem(d: dep)
                
        return cell
    }



}

