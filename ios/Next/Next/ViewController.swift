//
//  ViewController.swift
//  Next
//
//  Created by Hannes Waller on 2015-03-14.
//  Copyright (c) 2015 Hannes Waller. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    @IBOutlet weak var lineNumberLabel: UILabel!
    @IBOutlet weak var timeLabel: UILabel!
    @IBOutlet weak var lineDestinationLabel: UILabel!
    @IBOutlet weak var typeImgView: UIImageView!
    @IBOutlet weak var tableView: UITableView!
    
    var lines = [Departure(lineNumber: "17", lineDestination: "Rikshospitalet", timeToDeparture: "2", imageType: "trikk")]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        

        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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
        var cell:UITableViewCell = self.tableView.dequeueReusableCellWithIdentifier("customCell") as UITableViewCell
        
        
        return cell
    }



}

